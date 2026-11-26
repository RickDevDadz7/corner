package com.tairen.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // cara de app, não de site: sem barra de rolagem e sem "puxar" a página pros lados
        if (getBridge() != null) {
            WebView w = getBridge().getWebView();
            if (w != null) {
                w.setVerticalScrollBarEnabled(false);
                w.setHorizontalScrollBarEnabled(false);
                w.setOverScrollMode(View.OVER_SCROLL_NEVER);
            }
        }
    }
}
