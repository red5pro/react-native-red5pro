package com.red5pro.reactnative.view;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Rect;
import android.hardware.Camera;
import android.os.Binder;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.Surface;
import android.view.WindowManager;

import com.red5pro.streaming.R5Connection;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.R5StreamProtocol;
import com.red5pro.streaming.config.R5Configuration;
import com.red5pro.streaming.source.R5Camera;
import com.red5pro.streaming.source.R5Microphone;
import com.red5pro.streaming.view.R5VideoView;

public class PublishService extends Service {

	public PublishServicable servicable;

	private Notification holderNote;
	private final PublishServiceBinder mBinder = new PublishServiceBinder();


	@Nullable
	@Override
	public IBinder onBind(Intent intent) {
		return mBinder;
	}

	@Override
	public void onCreate() {
		Log.d("R5VideoViewLayout", "PublishService:onCreate()");
		super.onCreate();
	}

//	private void attachDisplay() {
//		preview.attachStream(publish);
//		preview.showDebugView(TestContent.GetPropertyBool("debug_view"));
//	}
//

	public void setServicableDelegate(PublishServicable servicable) {

		Log.d("R5VideoViewLayout", "PublishService:setServicableDelegate()");
		if (servicable == null) {

			return;

		} else {

			this.servicable = servicable;
			startPublish();

		}
	}

	private void startPublish() {
		this.servicable.publishBound();
	}

	public void setDisplayOn(boolean setOn) {

		Log.d("R5VideoViewLayout", "PublishService:setDisplayOn()");
		if (!setOn) {
//			publish.restrainVideo(true);
//			cam.stopPreview();
//			cam.release();
//			cam = null;

			Log.d("R5VideoViewLayout", "PublishService:setDisplayOn(false)");
			if (holderNote == null) {
				holderNote = (new Notification.Builder(getApplicationContext()))
						.setContentTitle("Red5 Pro")
						.setContentText("Publishing from the background")
						.setSmallIcon(android.R.drawable.ic_media_play)
						.build();
				startForeground(57234111, holderNote);
			}

		} else {

			Log.d("R5VideoViewLayout", "PublishService:setDisplayOn(true)");
			if (holderNote != null) {
				stopForeground(true);
				holderNote = null;
			}

//			cam = openFrontFacingCamera();
//			cam.setDisplayOrientation((camOrientation + 180) % 360);
//			camera.setCamera(cam);
//			camera.setOrientation(camOrientation);
//
//			publish.restrainVideo(false);
//			cam.startPreview();
		}
	}

	@Override
	public void onDestroy() {

		Log.d("R5VideoViewLayout", "PublishService:onDestroy()");
		if (holderNote != null) {
			stopForeground(true);
			holderNote = null;
		}

//		if (publish != null) {
//			publish.stop();
//			publish = null;
//		}
//		if (cam != null) {
//			cam.stopPreview();
//			cam.release();
//			cam = null;
//		}

		servicable = null;
		super.onDestroy();
	}

//	protected Camera openFrontFacingCamera() {
//		int cameraCount = 0;
//		Camera cam = null;
//		Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
//		cameraCount = Camera.getNumberOfCameras();
//		for (int camIdx = 0; camIdx < cameraCount; camIdx++) {
//			Camera.getCameraInfo(camIdx, cameraInfo);
//			if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
//				try {
//					cam = Camera.open(camIdx);
//					camOrientation = cameraInfo.orientation;
//					applyDeviceRotation();
//					break;
//				} catch (RuntimeException e) {
//					e.printStackTrace();
//				}
//			}
//		}
//
//		return cam;
//	}
//
//	protected void applyDeviceRotation() {
//		WindowManager window = (WindowManager) getSystemService(Context.WINDOW_SERVICE);
//
//		int rotation = window.getDefaultDisplay().getRotation();
//		int degrees = 0;
//		switch (rotation) {
//			case Surface.ROTATION_0:
//				degrees = 0;
//				break;
//			case Surface.ROTATION_90:
//				degrees = 270;
//				break;
//			case Surface.ROTATION_180:
//				degrees = 180;
//				break;
//			case Surface.ROTATION_270:
//				degrees = 90;
//				break;
//		}
//
//		Rect screenSize = new Rect();
//		window.getDefaultDisplay().getRectSize(screenSize);
//		float screenAR = (screenSize.width() * 1.0f) / (screenSize.height() * 1.0f);
//		if ((screenAR > 1 && degrees % 180 == 0) || (screenAR < 1 && degrees % 180 > 0))
//			degrees += 180;
//
//		System.out.println("Apply Device Rotation: " + rotation + ", degrees: " + degrees);
//
//		camOrientation += degrees;
//
//		camOrientation = camOrientation % 360;
//	}

	class PublishServiceBinder extends Binder {
		PublishService getService() {
			return PublishService.this;
		}
	}

	public interface PublishServicable {
		void publishBound();
	}
}
