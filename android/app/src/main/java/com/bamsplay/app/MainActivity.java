package com.bamsplay.app;

import android.app.PictureInPictureParams;
import android.os.Build;
import android.os.Bundle;
import android.util.Rational;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebSettings webSettings = getBridge().getWebView().getSettings();
                webSettings.setMediaPlaybackRequiresUserGesture(false);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams.Builder builder = new PictureInPictureParams.Builder()
                    .setAspectRatio(new Rational(16, 9));
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    builder.setAutoEnterEnabled(true);
                }
                enterPictureInPictureMode(builder.build());
            } catch (Exception ignored) {}
        }
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
