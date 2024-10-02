import moment from "moment";
import React, { useState } from "react";
import { HiFlag } from "react-icons/hi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { RiSearch2Line } from "react-icons/ri";

const Teamtasks = ({
  team,
  index,
  assignedtasks,
  selfindex,
  clickself,
  data,
  handleImageClick,
}) => {
  const data1 = [
    "Apple",
    "Banana",
    "Cherry",
    "Date",
    "Grape",
    "Mango",
    "Orange",
  ];

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [isInputVisible, setInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleSearch = () => {
    setInputVisible(true);
  };

  const handleClose = () => {
    setInputVisible(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // const sortedTasks = [...assignedtasks].sort((a, b) => {
  //   return sortOrder === "newest"
  //     ? new Date(b.createdAt) - new Date(a.createdAt)
  //     : new Date(a.createdAt) - new Date(b.createdAt);
  // });

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  return (
    <div className="w-full px-2">
      <div
        className={`rounded-lg text-[12px] h-[50px] font-semibold px-4 flex justify-between items-center ${
          index === 0 ? "mt-1" : "my-2"
        } gap-x-1 `}
      >
        Total Team Task : {team?.assignedtasks?.length} task
      </div>

      <div
        key={index}
        className="w-full items-center justify-center rounded-xl bg-white flex flex-col"
      >
        {/* For each task */}
        <div className="h-[60px] px-4 w-[100%] items-center justify-between flex flex-row">
          <div className="flex">
            <div className=" flex items-center justify-center">
              <div className="h-[40px] w-[40px] rounded-full bg-yellow-500 ">
                {/* <div
                  // src={{ uri: task?.dp }}
                  className="h-[40px] w-[40px] rounded-full bg-red-50 -ml-[3px] border-2 border-yellow-500 -mt-[3px]"
                >
                  {getInitials(team?.teamname)}
                </div> */}

                <div className="h-[40px] flex justify-center items-center text-lg font-semibold text-white rounded-full w-[40px] bg-[#FFC248]">
                  {getInitials(team?.teamname)}
                </div>
              </div>
            </div>
            <div className="  h-[100%] px-2 flex flex-col">
              <div className=" flex flex-row  text-[16px] font-semibold">
                {team?.teamname}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-[12px] font-semibold text-[#414141] w-[100%] ">
                  {team?.admin?.name}
                </div>
                <div
                  className="bg-blue-400 items-center justify-center flex
   w-[30px] h-[15px] text-white p-2 rounded-md  text-[8px] ml-1"
                >
                  Admin
                </div>
              </div>
            </div>
          </div>
          <div className=" flex justify-center pn:max-sm:hidden">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-start">
                {team?.members?.slice(0, 4)?.map((f, ind) => (
                  <div
                    className={`h-[25px] w-[25px] rounded-full overflow-hidden z-0 ${
                      ind == 0 && "bg-slate-300"
                    } ${ind == 1 && "bg-slate-200"} ${
                      ind == 2 && "bg-slate-100"
                    } ${ind == 3 && "bg-slate-50"} -mr-2`}
                  >
                    <img
                      src={process.env.NEXT_PUBLIC_URL + f?.dp}
                      className="w-full h-full object-cover"
                    />
                    {console.log(team?.members)}
                  </div>
                ))}
              </div>
              <div className="text-[12px] font-semibold text-[#414141] w-[100%] pl-3 mr-4 ">
                {team?.members?.length > 1
                  ? `${team?.members?.length} Members`
                  : `${team?.members?.length} Member`}
              </div>
            </div>
            <div
              className="bg-white rounded-3xl p-1 border border-[#EAEEF4] cursor-pointer"
              onClick={toggleDropdown}
            >
              <div className="flex relative items-center text-[13px] text-[#444444] font-medium px-2">
                Sort by : {sortOrder}
                {isDropdownOpen ? (
                  <MdKeyboardArrowUp className="mt-1 ml-1" />
                ) : (
                  <MdKeyboardArrowDown className="mt-1 ml-1" />
                )}
                {isDropdownOpen && (
                  <div className="absolute bg-white top-7 rounded-lg shadow-lg w-full p-2 border border-[#EAEEF4]">
                    <div
                      onClick={() => {
                        setSortOrder("newest");
                        setDropdownOpen(false);
                      }}
                      className="py-1 hover:bg-gray-100 cursor-pointer"
                    >
                      Newest
                    </div>
                    <div
                      onClick={() => {
                        setSortOrder("oldest");
                        setDropdownOpen(false);
                      }}
                      className="py-1 hover:bg-gray-100 cursor-pointer"
                    >
                      Oldest
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-[98%] m-2  flex gap-2 flex-col rounded-2xl text-black">
          {team?.assignedtasks?.length > 0 ? (
            assignedtasks
              .sort((a, b) => {
                return sortOrder === "newest"
                  ? new Date(b.createdAt) - new Date(a.createdAt)
                  : new Date(a.createdAt) - new Date(b.createdAt);
              })
              .map((m, i) => (
                <div key={i} className={`w-full border-b-[1px] `}>
                  {console.log(m?.assignedBy?.name, m)}
                  <div className="bg-orange-950 w-[50%]"></div>
                  <div>
                    <div className="text-[14px] w-[100%] text-[#414141] ">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-[12px]">
                          Assigned by: {m?.assignedBy?.name}
                        </div>
                        <div className="text-[12px] text-[#414141] ">
                          {moment(m.createdAt).format("MMMM Do, YYYY")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-[#FFF8EB] flex justify-between p-2 mt-4 mb-2 rounded-lg shadow-md ">
                    <p
                      className="text-[13px] text-black "
                      style={{
                        wordBreak: "break-word",
                        width: "calc(100% - 80px)",
                      }}
                    >
                      {m?.task}
                    </p>
                    <div className="w-[80px] flex items-center justify-end">
                      <div
                        onClick={() => {
                          handleImageClick({
                            taskid: m._id,
                            id: data.id,
                            progress: m?.progress,
                          });
                        }}
                        className="object-contain text-[14px] px-2 rounded-full flex gap-2 justify-center items-center mb-5 w-[100%]"
                      >
                        {/* Icon with conditional color changes */}
                        <HiFlag
                          className={`text-[18px]  ${
                            m?.progress === "Not Started"
                              ? "text-red-500"
                              : m?.progress === "In progress"
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        />

                        <div
                          className={`duration-100 ${
                            clickself === true && i === selfindex
                              ? "h-auto w-auto text-[#000000] font-medium top-5 bg-white p-1 shadow-lg rounded-lg absolute z-50 text-[14px]"
                              : "h-0 w-0 text-[0px] shadow-sm p-0"
                          }`}
                        >
                          <div
                            className={`${
                              clickself === true && i === selfindex
                                ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                : "py-0 duration-100 cursor-pointer px-0"
                            }`}
                          >
                            Not started
                          </div>
                          <div
                            className={`${
                              clickself === true && i === selfindex
                                ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                : "py-0 duration-100 cursor-pointer px-0"
                            }`}
                          >
                            In progress
                          </div>
                          <div
                            className={`${
                              clickself === true && i === selfindex
                                ? "hover:bg-[#f8f8f8] rounded-lg py-1 duration-100 cursor-pointer px-2"
                                : "py-0 duration-100 cursor-pointer px-0"
                            }`}
                          >
                            Done
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setViewtask(!viewtask);
                      setViewindex(index);
                    }}
                    className="w-[100%] flex items-center justify-center underline hover:text-slate-500"
                  ></div>
                </div>
              ))
          ) : (
            <div className="w-[100%] text-[12px] font-semibold flex items-center justify-center">
              No assigned tasks yet
            </div>
          )}

          <div className=" object-contain flex items-start justify-center py-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Teamtasks;
