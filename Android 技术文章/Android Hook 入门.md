```java
    private void hookOnClickListener(View view) {
        try {
            // 得到 View 的 ListenerInfo 对象
            Method getListenerInfo = View.class.getDeclaredMethod("getListenerInfo");
            getListenerInfo.setAccessible(true);
            Object listenerInfo = getListenerInfo.invoke(view);
            // 得到 原始的 OnClickListener 对象
            Class<?> listenerInfoClz = Class.forName("android.view.View$ListenerInfo");
            Field mOnClickListener = listenerInfoClz.getDeclaredField("mOnClickListener");
            mOnClickListener.setAccessible(true);
            View.OnClickListener originOnClickListener = (View.OnClickListener) mOnClickListener.get(listenerInfo);
            // 用自定义的 OnClickListener 替换原始的 OnClickListener
            View.OnClickListener hookedOnClickListener = new HookedOnClickListener(originOnClickListener);
            mOnClickListener.set(listenerInfo, hookedOnClickListener);
        } catch (Exception e) {
            Log.e("hook clickListener failed!", e.getMessage());
        }
    }

    public void hookH_Handler() {
        try {
            //拿到 ActivityThread#H
            Class<?> aActivityThread = Class.forName("android.app.ActivityThread");
            Field sAT = aActivityThread.getDeclaredField("sCurrentActivityThread");
            sAT.setAccessible(true);
            Object sCurrentActivityThread = sAT.get(null);
                    //拿到 ActivityThread#H
            Field mH = aActivityThread.getDeclaredField("mH");
            mH.setAccessible(true);
            Handler h_handler = (Handler) mH.get(sCurrentActivityThread);

            Field field = Handler.class.getDeclaredField("mCallback");
            field.setAccessible(true);
            field.set(h_handler, new HCallback(h_handler));
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }


    public class HCallback implements Handler.Callback{
        public static final int LAUNCH_ACTIVITY = 100;
        Handler mHandler;
        public HCallback(Handler handler) {
            mHandler = handler;
        }
        @Override
        public boolean handleMessage(Message msg) {
            if (msg.what == LAUNCH_ACTIVITY) {
                Object r = msg.obj;

            }
            mHandler.handleMessage(msg);
            return true;
        }
    }




    class HookedOnClickListener implements View.OnClickListener {
        private View.OnClickListener origin;

        HookedOnClickListener(View.OnClickListener origin) {
            this.origin = origin;
        }

        @Override
        public void onClick(View v) {
            Toast.makeText(MainActivity.this, "hook click", Toast.LENGTH_SHORT).show();
            Log.i("Before click, do what you want to to.", "");
            if (origin != null) {
//                origin.onClick(v);
            }
            Log.i("After click, do what you want to to.", "");
        }
    }
```

