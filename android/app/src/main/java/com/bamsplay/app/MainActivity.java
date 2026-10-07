package com.bamsplay.app;

import android.app.PictureInPictureParams;
import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
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

                // Expose AndroidBridge so JavaScript can signal playback status
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void setPlaybackState(boolean playing) {
                        isAudioPlaying = playing;
                        runOnUiThread(() -> updatePiPParams(playing));
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

                // Center square source hint to make the transition compact and seamless
                try {
                    DisplayMetrics dm = getResources().getDisplayMetrics();
                    int cx = dm.widthPixels / 2;
                    int cy = dm.heightPixels / 2;
                    int halfSize = Math.min(dm.widthPixels, dm.heightPixels) / 4;
                    builder.setSourceRectHint(new Rect(cx - halfSize, cy - halfSize, cx + halfSize, cy + halfSize));
                } catch (Exception ignored) {}

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
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.evaluateJavascript("if (window.__setPiPMode) { window.__setPiPMode(" + isInPictureInPictureMode + "); }", null);
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

