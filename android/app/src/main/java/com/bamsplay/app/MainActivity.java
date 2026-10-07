package com.bamsplay.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
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

                // Expose AndroidBridge so JavaScript can check platform and status safely
                webView.addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    public void setPlaybackState(boolean playing) {
                        isAudioPlaying = playing;
                    }

                    @JavascriptInterface
                    public boolean isAndroidApp() {
                        return true;
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

    @Override
    public void onPause() {
        super.onPause();
        // Keep timers and playback alive when app is minimized into background
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
        // Keep timers and audio stream uninterrupted in background
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.resumeTimers();
            }
        } catch (Exception ignored) {}
    }
}
