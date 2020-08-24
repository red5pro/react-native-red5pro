package com.red5pro.reactnative.view;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import android.util.Log;

public class PublishService extends Service {

	public PublishServicable servicable;

	private Notification holderNote;
	private final PublishServiceBinder mBinder = new PublishServiceBinder();

	private final String NOTIFICATION_CHANNEL_ID = "com.red5pro.reactnative";

	@Nullable
	@Override
	public IBinder onBind(Intent intent) {
		return mBinder;
	}

	@Override
	public void onCreate() {
		Log.d("R5VideoViewLayout", "PublishService:onCreate()");
		super.onCreate();

		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
			NotificationChannel notificationChannel = new NotificationChannel(
					NOTIFICATION_CHANNEL_ID,
					"Publisher",
					NotificationManager.IMPORTANCE_LOW);
			NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			manager.createNotificationChannel(notificationChannel);
		}
	}

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

			Log.d("R5VideoViewLayout", "PublishService:setDisplayOn(false)");
			if (holderNote == null) {
				Notification.Builder notificationBuilder = null;

				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
					notificationBuilder = new Notification.Builder(getApplicationContext(), NOTIFICATION_CHANNEL_ID);
				} else {
					notificationBuilder = new Notification.Builder(getApplicationContext());
				}

				holderNote = notificationBuilder
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

		}
	}

	@Override
	public void onDestroy() {

		Log.d("R5VideoViewLayout", "PublishService:onDestroy()");
		if (holderNote != null) {
			stopForeground(true);
			holderNote = null;
		}

		servicable = null;
		super.onDestroy();
	}

	public class PublishServiceBinder extends Binder {
		public PublishService getService() {
			return PublishService.this;
		}
	}

	public interface PublishServicable {
		void publishBound();
	}
}
