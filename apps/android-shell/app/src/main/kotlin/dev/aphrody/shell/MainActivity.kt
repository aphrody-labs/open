package dev.aphrody.shell

import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/** JNI bridge to libayjni.so, which links libaysys.so (src/android/jni.c). */
object Native {
    init {
        System.loadLibrary("ayjni")
    }

    @JvmStatic external fun fnv1a(s: String): String
    @JvmStatic external fun abiVersion(): Int
    @JvmStatic external fun cpu(): String
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val input = "aphrody-android"
        val fnv = Native.fnv1a(input)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Text("Aphrody shell", style = MaterialTheme.typography.headlineMedium)
                        Text("libaysys.so ABI v${Native.abiVersion()}")
                        Text("FNV-1a64(\"$input\") = $fnv")
                        Text("cpu: ${Native.cpu()}")
                        Text("Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT}) ${Build.SUPPORTED_ABIS.first()}")
                    }
                }
            }
        }
    }
}
