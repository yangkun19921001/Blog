## 流程

RoomActivity->onGranted()->mRoomClient.join();->new Protoo(transport, peerListener);->handleTransport();->newWebSocket()->onOpen()->mListener.onOpen();->joinImpl()->mMediasoupDevice.load -> 