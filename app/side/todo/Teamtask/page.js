"use client";
import React, { useCallback, useEffect, useState } from "react";
import pic from "../../../assets/empty.png";
import task from "../../../assets/task.png";
import redflag from "../../../assets/redflag.png";
import greenflag from "../../../assets/greenflag.png";

import { FaAngleDown } from "react-icons/fa6";
import { LuSearch } from "react-icons/lu";
import { HiFlag } from "react-icons/hi";
import { RiSearch2Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import TaskModal from "../../Compo/Addtask";
import TeamModal from "../../Compo/Addteamtask";
import axios from "axios";
import Cookies from "js-cookie";
import { decryptaes } from "@/app/security";
import { API } from "@/utils/Essentials";
import moment from "moment";
import { useAuthContext } from "@/utils/auth";
import { MdKeyboardArrowUp } from "react-icons/md";
import Teamtasks from "@/app/Components/Teamtasks";

function page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamtasks, setTeamtasks] = useState(false);
  const [assignedtasks, setAssignedasks] = useState([]);
  const [team, setTeam] = useState([]);
  // const [load, setLoad] = useState("load");
  // const [click, setClick] = useState(false);
  const [clickself, setClickself] = useState(false);
  const [selfindex, setSelfindex] = useState(-1);
  const { data } = useAuthContext();
  const [viewtask, setViewtask] = useState(true);
  const [viewindex, setViewindex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const id = data.id;

  const [orgid, setOrgid] = useState("");
  useEffect(() => {
    const s = localStorage.getItem("orgid");
    setOrgid(s);
  }, []);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const open = () => {
    setTeamtasks(true);
  };

  const close = () => {
    setTeamtasks(false);
  };

  const handleImageClick = async ({ taskid, id, progress }) => {
    try {
      // Determine the new progress status
      const newProgress = progress === "Not Started" ? "completed" : "pending";

      const updatedTasks = assignedtasks.map((task) => {
        if (task?._id === taskid) {
          return { ...task, progress: newProgress };
        }
        return task;
      });

      await axios.post(`${API}/updatetask`, {
        id,
        taskid,
        progress: newProgress,
      });

      setAssignedasks(updatedTasks); // Uncomment if needed
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/getAssignedTasks/${id}`);

      setAssignedasks(res?.data?.assignedTasks);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  console.log(assignedtasks, "Assignedasks");

  useEffect(() => {
    if (id) {
      getTasks();
    }
  }, [id]);

  const combinedTasks = [
    ...assignedtasks.map((task) => ({
      ...task,
      type: "task",
      timestamp: task.createdAt,
    })),
  ];

  combinedTasks.sort((a) => new Date(a.timestamp));

  // Fetch teams
  const getTeams = async () => {
    try {
      const response = await axios.get(`${API}/getteams/${orgid}`);

      const updatedTeams = response.data.teams.filter((team) =>
        team.members.some((member) => member._id === data?.id)
      );

      setTeam(updatedTeams);
      //setTeam(response.data.teams);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (orgid) {
      getTeams();
    }
  }, [orgid]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredResults = team.filter((item) =>
        item.teamname.toLowerCase().includes(value.toLowerCase())
      );

      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
    console.log("Search button clicked!");
  };

  const sortChatsByDate = () => {
    const sortedChats = [...chats].sort((a, b) => {
      const dateA = new Date(a?.date); // Convert to Date object
      const dateB = new Date(b?.date);

      // Toggle sorting order between ascending and descending
      return isSortedByDate
        ? dateB - dateA // Descending order
        : dateA - dateB; // Ascending order
    });
  };

  return (
    <div className="font-sans scrollbar-hide h-[100%] flex flex-col justify-evenly items-center">
      {/* Tasks */}
      <div className="h-[100%] w-[100%] bg-[#EAEEF4]  rounded-2xl  flex flex-col justify-between items-center object-contain">
        {/* <div className="text-black text-[12px] font-semibold w-full ml-8 mt-2">
          Total Team Task : 2 tasks
        </div> */}
        <div className="p-2 pl-4 w-[100%] flex items-center ">
          {/* <div className="text-[14px] text-[#444444] font-semibold">
            Total: {tasks?.tasks?.length || 0} Team Tasks
          </div> */}
        </div>

        <div className="h-full scrollbar-hide overflow-auto  w-[100%] flex flex-col justify-start items-center">
          {assignedtasks.length < 1 ? (
            <div className="h-full w-full flex flex-col justify-center items-center">
              {/* for empty task */}
              <Image src={pic} className="h-[300px] w-[300px]" />
              <div className="flex flex-row items-center justify-between">
                <Image src={task} className="h-[25px] w-[25px]" />
                <div className="text-[18px] mx-2 text-[#444444] font-semibold">
                  No tasks found.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className=" flex justify-center w-full px-2">
                <div className="h-[40px] w-[50%] bg-white py-1 flex items-center px-1 text-[12px] rounded-2xl text-[#BEBEBE]">
                  <input
                    type="text"
                    placeholder="Search Teams"
                    className="w-full bg-transparent outline-none px-1 text-black text-sm"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <RiSearch2Line className="text-black text-[20px] mr-2" />
                </div>
              </div>

              <>
                {searchTerm ? (
                  <>
                    {searchResults.map((team, index) => {
                      return (
                        <Teamtasks
                          team={team}
                          index={index}
                          data={data}
                          assignedtasks={assignedtasks}
                          clickself={clickself}
                          handleImageClick={handleImageClick}
                          selfindex={selfindex}
                        />
                      );
                    })}
                  </>
                ) : (
                  <>
                    {team.map((team, index) => {
                      return (
                        <Teamtasks
                          team={team}
                          index={index}
                          data={data}
                          assignedtasks={assignedtasks}
                          clickself={clickself}
                          handleImageClick={handleImageClick}
                          selfindex={selfindex}
                        />
                      );
                    })}
                  </>
                )}
              </>
            </>
          )}
        </div>
      </div>
      <TeamModal isOpen={teamtasks} onClose={close} />
    </div>
  );
}

export default page;
