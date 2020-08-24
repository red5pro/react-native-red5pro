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

public class SubscribeService  extends Service {

	public SubscribeService.SubscribeServicable servicable;

	private Notification holderNote;
	private final SubscribeService.SubscribeServiceBinder mBinder = new SubscribeService.SubscribeServiceBinder();

	private final String NOTIFICATION_CHANNEL_ID = "com.red5pro.reactnative";

	@Nullable
	@Override
	public IBinder onBind(Intent intent) {
		return mBinder;
	}

	@Override
	public void onCreate() {
		Log.d("R5VideoViewLayout", "SubscribeService:onCreate()");
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

	public void setServicableDelegate(SubscribeService.SubscribeServicable servicable) {

		Log.d("R5VideoViewLayout", "SubscribeService:setServicableDelegate()");
		if (servicable == null) {

			return;

		} else {

			this.servicable = servicable;
			startSubscribe();

		}
	}

	private void startSubscribe() {
		this.servicable.subscribeBound();
	}

	public void setDisplayOn(boolean setOn) {

		Log.d("R5VideoViewLayout", "SubscribeService:setDisplayOn()");
		if (!setOn) {

			Log.d("R5VideoViewLayout", "SubscribeService:setDisplayOn(false)");
			if (holderNote == null) {
				Notification.Builder notificationBuilder = null;

				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
					notificationBuilder = new Notification.Builder(getApplicationContext(), NOTIFICATION_CHANNEL_ID);
				} else {
					notificationBuilder = new Notification.Builder(getApplicationContext());
				}

				holderNote = notificationBuilder
						.setContentTitle("Red5 Pro")
						.setContentText("Subscribing from the background")
						.setSmallIcon(android.R.drawable.ic_media_play)
						.build();
				startForeground(7335776, holderNote);
			}

		} else {

			Log.d("R5VideoViewLayout", "SubscribeService:setDisplayOn(true)");
			if (holderNote != null) {
				stopForeground(true);
				holderNote = null;
			}

		}
	}

	@Override
	public void onDestroy() {

		Log.d("R5VideoViewLayout", "SubscribeService:onDestroy()");
		if (holderNote != null) {
			stopForeground(true);
			holderNote = null;
		}

		servicable = null;
		super.onDestroy();
	}

	public class SubscribeServiceBinder extends Binder {
		public SubscribeService getService() {
			return SubscribeService.this;
		}
	}

	public interface SubscribeServicable {
		void subscribeBound();
	}
}
