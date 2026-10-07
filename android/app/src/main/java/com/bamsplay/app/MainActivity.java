package com.bamsplay.app;

import android.app.PictureInPictureParams;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Rational;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private volatile boolean isAudioPlaying = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                WebSettings webSettings = webView.getSettings();
                webSettings.setMediaPlaybackRequiresUserGesture(false);
                webSettings.setJavaScriptEnabled(true);
                webSettings.setDomStorageEnabled(true);
                webSettings.setDatabaseEnabled(true);

                // Expose AndroidBridge so JavaScript can query PiP state and playback status
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void setPlaybackState(boolean playing) {
                        isAudioPlaying = playing;
                        runOnUiThread(() -> updatePiPParams(playing));
                    }

                    @JavascriptInterface
                    public boolean isAndroidApp() {
                        return true;
                    }

                    @JavascriptInterface
                    public boolean isInPiP() {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            return isInPictureInPictureMode();
                        }
                        return false;
                    }

                    @JavascriptInterface
                    public void openExternalUrl(String url) {
                        try {
                            if (url != null && !url.isEmpty()) {
                                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                                startActivity(intent);
                            }
                        } catch (Exception ignored) {}
                    }
                }, "AndroidBridge");
            }
        } catch (Exception ignored) {}
    }

    private PictureInPictureParams buildPiPParams(boolean autoEnter) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams.Builder builder = new PictureInPictureParams.Builder()
                    .setAspectRatio(new Rational(1, 1));

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    builder.setAutoEnterEnabled(autoEnter);
                }
                return builder.build();
            } catch (Exception ignored) {}
        }
        return null;
    }

    private void updatePiPParams(boolean playing) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams params = buildPiPParams(playing);
                if (params != null) {
                    setPictureInPictureParams(params);
                }
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onUserLeaveHint() {
        super.onUserLeaveHint();
        // Only enter PiP if music is actively playing
        if (!isAudioPlaying) {
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams params = buildPiPParams(true);
                if (params != null) {
                    enterPictureInPictureMode(params);
                }
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, android.content.res.Configuration newConfig) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
        notifyPiPMode(isInPictureInPictureMode);
    }

    @Override
    public void onResume() {
        super.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            notifyPiPMode(isInPictureInPictureMode());
        }
    }

    private void notifyPiPMode(boolean inPiP) {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.post(() -> {
                    webView.evaluateJavascript("if (window.__setPiPMode) { window.__setPiPMode(" + inPiP + "); }", null);
                });
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.resumeTimers();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onStop() {
        super.onStop();
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.resumeTimers();
            }
        } catch (Exception ignored) {}
    }
}
