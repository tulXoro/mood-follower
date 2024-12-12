package com.tulxoro.mfollower;

import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class FriendsListWidgetFactory implements RemoteViewsService.RemoteViewsFactory {
    private final Context context;
    private final List<Friend> friendsList = new ArrayList<>();

    public FriendsListWidgetFactory(Context context) {
        this.context = context;
    }

    @Override
    public void onCreate() {
        loadData();
    }

    @Override
    public void onDataSetChanged() {
        loadData();
    }

    @Override
    public void onDestroy() {
        friendsList.clear();
    }

    @Override
    public int getCount() {
        return friendsList.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.friends_list_widget_item);
        Friend friend = friendsList.get(position);
        views.setTextViewText(R.id.appwidget_friend_item_name, friend.getName());
        views.setTextViewText(R.id.appwidget_friend_item_mood, friend.getStatus());
        views.setTextViewText(R.id.appwidget_friend_item_status, friend.getEmoji());
        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 0;
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public boolean hasStableIds() {
        return false;
    }

    private void loadData() {
        friendsList.clear();
        SharedPreferences sharedPref = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);
        String appString = sharedPref.getString("appData", "{\"friends\": []}");
        try {
            JSONObject appData = new JSONObject(appString);
            JSONArray friendsArray = appData.getJSONArray("friends");
            for (int i = 0; i < friendsArray.length(); i++) {
                JSONObject friendObject = friendsArray.getJSONObject(i);
                String name = friendObject.getString("name");
                String emoji = friendObject.getString("mood");
                String status = friendObject.getString("status");
                friendsList.add(new Friend(name, emoji, status));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}
