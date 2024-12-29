import React, { useContext, useEffect, useRef } from "react";

import { useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { baseURL } from "../config/axiosHelper";
import { toast } from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();

  const navigate = useNavigate();
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([
    {
      content: "Hello...",
      sender: "Apuroop",
    },
    {
      content: "Hi, How are you?",
      sender: "Charan",
    },
    {
      content: "Hey, guys...",
      sender: "Shashank",
    },
    {
      content: "Wsup..gang...!",
      sender: "Chirag",
    },
    {
      content: "Finally, everyone is here...yayy!",
      sender: "Apuroop",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  //page init:
  //have to load messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        // console.log(messages);

        setMessages(messages);
      } catch (error) {
        console.log(error);
      }
    }

    if (connected) {
      loadMessages();
    }
  }, []);

  //scroll to the latest

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //stomp client initialization
  //subscribe

  useEffect(() => {
    const connectWebSocket = () => {
      //sockJS

      const sock = new SockJS(`${baseURL}/chat`);

      const client = Stomp.over(sock);

      client.connect({}, () => {
        setStompClient(client);

        toast.success("Connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

          //rest of the work after successfully receiving the messages
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  //send message handler

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);

      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput("");
    }
  };

  //logout

  function handleLogout() {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  }

  // enter key handling

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="">
      {/* this is a header */}
      <header className="dark:border-gray-700 shadow fixed w-full py-5 dark:bg-gray-800 flex justify-around items-center">
        {/* room name container */}
        <div>
          <h1 className="text-xl font-semibold">
            Room : <span>{roomId}</span>
          </h1>
        </div>
        {/* username container */}
        <div>
          <h1 className="text-xl font-semibold">
            Username : <span>{currentUser}</span>
          </h1>
        </div>
        {/* button : leave room  */}
        <div>
          <button
            onClick={handleLogout}
            className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full"
          >
            Leave Room
          </button>
        </div>
      </header>

      <main
        ref={chatBoxRef}
        className="py-20 px-10 w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`my-2 ${
                message.sender === currentUser ? "bg-blue-700" : "bg-purple-600"
              } p-2 max-w-xs rounded`}
            >
              <div className="flex flex-row gap-2">
                <img
                  className="h-10 w-10"
                  src={"https://avatar.iran.liara.run/public/46"}
                  alt=""
                />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">{message.sender}</p>
                  <p>{message.content}</p>
                  <p
                    className={`text-xs text-gray-800 flex ${
                      message.sender === currentUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {timeAgo(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* input message container */}
      <div className="fixed bottom-4 w-full h-14">
        <div className="h-full pr-10 flex items-center justify-between gap-4 w-1/2 mx-auto dark:bg-gray-800 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={handleKeyPress}
            type="text"
            placeholder="Type your message here....."
            className="h-full w-full dark:bg-gray-700 px-5 py-2 rounded-full focus:outline-none"
          />
          <div className="flex gap-2">
            <button className="dark:bg-purple-500 flex justify-center items-center h-10 w-10 rounded-full">
              <MdAttachFile size={20} />
            </button>
            <button
              onClick={sendMessage}
              className="dark:bg-green-500 flex justify-center items-center h-10 w-10 rounded-full"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
