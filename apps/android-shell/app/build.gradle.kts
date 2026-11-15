plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "dev.aphrody.shell"
    compileSdk = 37

    defaultConfig {
        applicationId = "dev.aphrody.shell"
        minSdk = 29
        targetSdk = 37
        versionCode = 1
        versionName = "0.1.0"
        ndk { abiFilters += "x86_64" }
    }

    buildTypes {
        debug { isMinifyEnabled = false }
    }

    sourceSets["main"].jniLibs.srcDir("../../../target/sys/android-x86_64/jniLibs")
}

dependencies {
    val bom = platform("androidx.compose:compose-bom:2026.09.00")
    implementation(bom)
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.core:core:1.19.1")
}
