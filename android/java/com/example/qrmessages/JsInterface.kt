package com.example.qrmessages

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.util.Log
import android.webkit.JavascriptInterface
import java.io.File

class JsInterface(private val context: Context) {
    @JavascriptInterface
    fun downloadFile(url: String, name: String){
        val request = DownloadManager.Request(Uri.parse(url)).apply {
            setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name)
            allowScanningByMediaScanner()
            setTitle(name)
            setDescription("Pobieram plik $name")
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        }

        val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        downloadManager.enqueue(request)
    }
}