package com.red5pro.reactnative;

import android.app.Activity;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.red5pro.reactnative.module.R5StreamModule;
import com.red5pro.reactnative.view.R5VideoViewManager;

import java.util.Collections;
import java.util.List;

public class R5Package implements ReactPackage {

    R5StreamModule mStreamModule;
    R5VideoViewManager mStreamVideoViewManager;

    @Override
    public List<ViewManager> createViewManagers(
            ReactApplicationContext reactContext) {
        mStreamVideoViewManager = new R5VideoViewManager(mStreamModule);
        return Collections.<ViewManager>singletonList(
                mStreamVideoViewManager
        );
    }

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        mStreamModule = new R5StreamModule(reactContext);
        if (mStreamVideoViewManager != null) {
            mStreamVideoViewManager.setModuleManager(mStreamModule);
        }
        return Collections.<NativeModule>singletonList(
                mStreamModule
        );
    }

}
