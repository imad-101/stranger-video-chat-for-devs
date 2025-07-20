import Image from "next/image";

export const GroupAvatarBubble3 = () => (
  <div className="relative bg-gradient-to-br from-[#0f0f11] to-[#1f1f23] rounded-full p-3 flex items-center shadow-md border border-[#FACC15]">
    <div className="flex items-center -space-x-2">
      <Image
        src="https://i.pravatar.cc/48?img=6"
        alt="User avatar"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full border-2 border-white"
      />
      <Image
        src="https://i.pravatar.cc/48?img=7"
        alt="User avatar"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full border-2 border-white"
      />
      <div className="w-8 h-8 rounded-full bg-[#FACC15] text-black text-[10px] font-bold flex items-center justify-center border-2 border-white">
        +2
      </div>
    </div>
    <VideoIcon className="ml-3 w-4 h-4 text-[#FACC15]" />
  </div>
);

export const GroupAvatarBubble4 = () => (
  <div className="relative bg-white p-2 rounded-full shadow-lg  flex items-center gap-2 border-[#FACC15]">
    <div className="flex items-center -space-x-2">
      <Image
        src="https://i.pravatar.cc/48?img=8"
        alt="User avatar"
        width={36}
        height={36}
        className="w-9 h-9 rounded-full ring-2 ring-gray-100"
      />
      <Image
        src="https://i.pravatar.cc/48?img=9"
        alt="User avatar"
        width={36}
        height={36}
        className="w-9 h-9 rounded-full ring-2 ring-gray-100"
      />
      <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-700 text-xs font-medium flex items-center justify-center ring-2 ring-gray-100">
        +4
      </div>
    </div>
    <div className="bg-[#10B981] p-2 rounded-full">
      <VideoIcon className="w-4 h-4 text-white" />
    </div>
  </div>
);

const VideoIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M17 10.5V6c0-1.1-.9-2-2-2H5C3.9 4 3 4.9 3 6v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4.5l4 4v-11l-4 4z" />
  </svg>
);
