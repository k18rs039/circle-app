import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Chat.css";
import TextField from "@mui/material/TextField";
import SendIcon from "@mui/icons-material/Send";
import { db } from "../../../../../app/firebase";
import { firebase } from "../../../../../app/firebase";
import { useSelector } from "react-redux";
function ChatRoomInputBox({ circleId }) {
  const user = useSelector((state) => state.login.data);
  const [chatMessage, setChatMessage] = useState();
  //function
  const handleChangeMessage = async (e) => {
    setChatMessage(e.target.value);
  };
  const sendMessage = async () => {
    let currentMessage = await chatMessage;
    await setChatMessage("");
    await db.collection("circle").doc(circleId).collection("chat").add({
      message: currentMessage,
      userName: user.displayName,
      userPhoto: user.photoURL,
      userId: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };
  return (
    <div className="center">
      <div className="chatInputBox">
        <TextField
          id="outlined-multiline-flexible"
          label="Chat Message"
          multiline
          maxRows={4}
          className="chatInput"
          size="small"
          value={chatMessage}
          onChange={handleChangeMessage}
        />
        <div className="chatSendIcon center">
          <div
            className="wrapChatSendIcon"
            onClick={() => {
              sendMessage();
            }}
          >
            <SendIcon
              fontSize="small"
              color="whiteColor"
              className="sendIcon"
            ></SendIcon>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message, userId }) {
  return (
    <>
      {userId == message.userId ? (
        <div className="messageItemLeft">
          <div className="messageBody">
            <p className="messageUserName messageUserNameLeft">{message.userName}</p>
            <div className="messageContentLeft">
              <div className="messageText">{message.message}</div>
            </div>
          </div>

          <div className="messagePhoto">
            <img src={message.userPhoto} alt="" className="messageUserPhoto" />
          </div>
        </div>
      ) : (
        <div className="messageItem">
          <div className="messagePhoto">
            <img src={message.userPhoto} alt="" className="messageUserPhoto" />
          </div>
          <div className="messageBody">
            <p className="messageUserName">{message.userName}</p>
            <div className="messageContent">
              <div className="messageText">{message.message}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChatMessages({ circleId }) {
  const [messages, setMessages] = useState();
  const userId = useSelector((state) => state.login.data.uid);
  useEffect(() => {
    getMessages();
  }, []);

  
  //function
  const getMessages = async () => {
    await db
      .collection("circle")
      .doc(circleId)
      .collection("chat")
      .orderBy("createdAt", "asc")
      .onSnapshot((querySnapshot) => {
        const data = [];
        querySnapshot.docs.map((doc) => {
          data.push(doc.data());
        });
        setMessages(data);
      });
  };
  return (
    <>
      {messages ? (
        <div className="center">
          <div className="messagesBox">
            {messages.map((message) => {
              return <ChatMessage message={message} userId={userId} />;
            })}
          </div>
        </div>
      ) : (
        "Loading"
      )}
    </>
  );
}

function ChatRoom({ circleId }) {
  return (
    <>
      <ChatMessages circleId={circleId}></ChatMessages>
      <ChatRoomInputBox circleId={circleId} />
    </>
  );
}

export default function Chat() {
  let { circleId } = useParams();
  return <>{circleId ? <ChatRoom circleId={circleId} /> : ""}</>;
}
