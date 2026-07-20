package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceError
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = MaterialTheme.colorScheme.background
        ) {
          GeoGlypherWebView(modifier = Modifier.fillMaxSize())
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled", "SetAllowFileAccessFromFileURLs")
@Composable
fun GeoGlypherWebView(modifier: Modifier = Modifier) {
  AndroidView(
    modifier = modifier,
    factory = { context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        
        // Optimize for performance
        setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)
        
        // Enable local file access and local storage interactions over file:// scheme
        settings.allowFileAccessFromFileURLs = true
        settings.allowUniversalAccessFromFileURLs = true
        
        webViewClient = object : WebViewClient() {
          override fun onReceivedError(
            view: WebView?,
            errorCode: Int,
            description: String?,
            failingUrl: String?
          ) {
            android.util.Log.e("GeoGlypherWeb", "Legacy Error: $failingUrl -- Code: $errorCode, Desc: $description")
          }

          override fun onReceivedError(
            view: WebView?,
            request: WebResourceRequest?,
            error: WebResourceError?
          ) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
              android.util.Log.e(
                "GeoGlypherWeb", 
                "Error: ${request?.url} -- Code: ${error?.errorCode}, Desc: ${error?.description}"
              )
            }
          }
        }
        
        webChromeClient = object : WebChromeClient() {
          override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            android.util.Log.d(
              "GeoGlypherWeb", 
              "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}"
            )
            return super.onConsoleMessage(consoleMessage)
          }
        }
        
        loadUrl("file:///android_asset/geoglypher/index.html")
      }
    }
  )
}

