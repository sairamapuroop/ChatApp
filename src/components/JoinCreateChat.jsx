// import React from "react";
import { useState } from "react";
import chatIcon from "../assets/Chat Icon.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  async function joinChat() {
    if (validateForm()) {
      // join chat
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined..");

        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);

        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error joining room");
          console.log(error);
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      // createroom
      try {
        const response = await createRoomApi(detail.roomId);
        console.log(response);
        toast.success("Room created successfully!");
        //join the room
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);

        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error("Room already exists !!");
        } else {
          console.log(error);
          toast.error("Error creating room");
        }
      }
    }
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid input details...");
      return false;
    }

    return true;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
        <div>
          <img src={chatIcon} className="w-20 mx-auto"></img>
        </div>
        <h1 className="text-2xl font-semibold text-center">
          Join Room / Create Room ..
        </h1>
        {/*name div*/}
        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Your Name
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            name="userName"
            placeholder="Enter the name"
            type="text"
            id="name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/*room id div*/}
        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Room ID / New Room ID
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.roomId}
            name="roomId"
            placeholder="Enter the room ID"
            type="text"
            id="name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* button */}
        <div className="flex justify-center gap-2">
          <button
            onClick={joinChat}
            className="px-3 py-2 dark:bg-blue-500 dark:hover:bg-blue-800 rounded-full"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-2 dark:bg-orange-500 dark:hover:bg-orange-800 rounded-full"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
