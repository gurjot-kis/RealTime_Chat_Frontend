import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setReplyingToMessage } from "@/features/chat/chatSlice";
import SeenIndicator from "./SeenIndicator";

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    time: string;
    isOwn: boolean;
    status?: "sent" | "delivered" | "seen";
    messageType?: string;
    mediaUrl?: string;
    senderAvatar?: string;
    senderName?: string;
    parentMessage?: {
      _id: string;
      text: string;
      messageType: string;
      senderName: string;
    };
    mediaItems?: {
      id: string;
      mediaUrl: string;
      messageType: string;
      text?: string;
    }[];
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { id, isOwn, text, time, status, messageType = "text", mediaUrl, mediaItems, parentMessage } = message;
  const dispatch = useAppDispatch();
  const loggedInUser = useAppSelector((state) => state.auth.user);
  
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getFileName = (url?: string) => {
    if (!url) return "File";
    const fullName = url.substring(url.lastIndexOf("/") + 1);
    const parts = fullName.split("-");
    if (parts.length >= 3) {
      return parts.slice(2).join("-");
    }
    return fullName;
  };

  const renderTextWithLinks = (inputText: string, isOwnMessage: boolean) => {
    if (!inputText) return "";

    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const parts = inputText.split(urlRegex);

    const linkColorClass = isOwnMessage
      ? "text-sky-300 hover:text-sky-200 font-semibold underline decoration-sky-300/40 hover:decoration-sky-200 transition-colors"
      : "text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors";

    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//i)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`break-all ${linkColorClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const mediaItemsToUse = messageType === "media_group"
    ? (mediaItems ?? [])
    : [{ id: message.id, mediaUrl: mediaUrl || "", messageType: messageType, text: text }];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveLightboxIndex(null);
      setIsClosing(false);
    }, 200);
  };

  // Keyboard navigation when Lightbox is active
  useEffect(() => {
    if (activeLightboxIndex === null || mediaItemsToUse.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) =>
          prev === 0 ? mediaItemsToUse.length - 1 : (prev ?? 0) - 1
        );
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) =>
          prev === mediaItemsToUse.length - 1 ? 0 : (prev ?? 0) + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLightboxIndex, mediaItemsToUse]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null && mediaItemsToUse.length > 0) {
      setActiveLightboxIndex((prev) =>
        prev === 0 ? mediaItemsToUse.length - 1 : (prev ?? 0) - 1
      );
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null && mediaItemsToUse.length > 0) {
      setActiveLightboxIndex((prev) =>
        prev === mediaItemsToUse.length - 1 ? 0 : (prev ?? 0) + 1
      );
    }
  };

  const handleScrollToParent = (parentId: string) => {
    const el = document.getElementById(`message-${parentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-flash");
      setTimeout(() => {
        el.classList.remove("highlight-flash");
      }, 1500);
    }
  };

  const renderReplyPreview = (parent: {
    _id: string;
    text: string;
    messageType: string;
    senderName: string;
  }) => {
    const displaySnippet = () => {
      if (parent.messageType === "image") return "📷 Photo";
      if (parent.messageType === "video") return "🎥 Video";
      if (parent.messageType === "file") return "📄 File";
      return parent.text;
    };

    return (
      <div
        onClick={() => handleScrollToParent(parent._id)}
        className={`mb-2 p-2 rounded-lg text-left text-xs border-l-4 cursor-pointer select-none bg-black/10 dark:bg-white/5 hover:bg-black/15 dark:hover:bg-white/10 transition-colors flex flex-col gap-0.5 ${
          isOwn
            ? "border-emerald-300 text-emerald-100/90"
            : "border-emerald-500 text-gray-600 dark:text-gray-300"
        }`}
      >
        <span className={`font-semibold ${isOwn ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
          {parent.senderName}
        </span>
        <span className="truncate max-w-[200px] sm:max-w-[280px]">
          {displaySnippet()}
        </span>
      </div>
    );
  };

  const renderContent = () => {
    switch (messageType) {
      case "media_group": {
        if (!mediaItems || mediaItems.length === 0) return null;

        return (
          <div className="flex flex-col gap-2">
            <div className={`grid gap-1 max-w-[280px] sm:max-w-[340px] ${
              mediaItems.length === 2 ? "grid-cols-2" :
              mediaItems.length === 3 ? "grid-cols-3" :
              "grid-cols-2"
            }`}>
              {mediaItems.slice(0, 4).map((item, idx) => {
                const isOverLimit = mediaItems.length > 4 && idx === 3;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveLightboxIndex(idx)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-slate-100 dark:bg-gray-800 transition-all hover:opacity-90 group/media"
                  >
                    {item.messageType === "image" ? (
                      <img
                        src={getMediaUrl(item.mediaUrl)}
                        alt="Media upload"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/media:scale-105"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={getMediaUrl(item.mediaUrl)}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <svg className="w-8 h-8 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {isOverLimit && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-lg select-none">
                        +{mediaItems.length - 3}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {text && <p className="mt-1 leading-relaxed whitespace-pre-wrap px-1">{renderTextWithLinks(text, isOwn)}</p>}
          </div>
        );
      }
      case "image":
        return (
          <div className="flex flex-col">
            <div 
              onClick={() => setActiveLightboxIndex(0)}
              className="relative max-w-[280px] sm:max-w-[340px] aspect-auto max-h-[300px] rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-gray-800 hover:opacity-95 transition-opacity"
            >
              <img
                src={getMediaUrl(mediaUrl)}
                alt="Image attachment"
                className="w-full h-full object-contain max-h-[300px] rounded-xl"
              />
            </div>
            {text && <p className="mt-2 leading-relaxed whitespace-pre-wrap px-1">{renderTextWithLinks(text, isOwn)}</p>}
          </div>
        );
      case "video":
        return (
          <div className="flex flex-col">
            <div 
              onClick={() => setActiveLightboxIndex(0)}
              className="relative max-w-[280px] sm:max-w-[340px] max-h-[300px] rounded-xl overflow-hidden cursor-pointer bg-slate-100 dark:bg-gray-800 hover:opacity-95 transition-opacity"
            >
              <video
                src={getMediaUrl(mediaUrl)}
                className="w-full max-h-[300px] rounded-xl"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-lg">
                  <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            {text && <p className="mt-2 leading-relaxed whitespace-pre-wrap px-1">{renderTextWithLinks(text, isOwn)}</p>}
          </div>
        );
      case "file":
        return (
          <div className="flex flex-col max-w-[280px] sm:max-w-[340px]">
            <a
              href={getMediaUrl(mediaUrl)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                isOwn
                  ? "bg-blue-700/50 border-blue-500/30 hover:bg-blue-700/70 text-white"
                  : "bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-900 dark:bg-gray-900/50 dark:border-gray-800 dark:hover:bg-gray-800/80"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 shadow-sm ${
                isOwn ? "bg-blue-500 text-white" : "bg-indigo-500 text-white"
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className={`text-sm font-medium truncate ${
                  isOwn ? "text-white" : "text-gray-900 dark:text-gray-100"
                }`}>
                  {getFileName(mediaUrl)}
                </p>
                <p className={`text-xs ${
                  isOwn ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                }`}>Click to open/download</p>
              </div>
            </a>
            {text && <p className="mt-1 leading-relaxed whitespace-pre-wrap px-1">{renderTextWithLinks(text, isOwn)}</p>}
          </div>
        );
      case "text":
      default:
        return <p className="leading-relaxed whitespace-pre-wrap">{renderTextWithLinks(text, isOwn)}</p>;
    }
  };

  const useCompactPadding = (messageType === "image" || messageType === "video" || messageType === "media_group") && !text;

  const renderLightbox = () => {
    if (activeLightboxIndex === null || mediaItemsToUse.length === 0 || !mounted) return null;

    const lightboxContent = (
      <div 
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-[4px] select-none ${
          isClosing ? "animate-fadeOut" : "animate-fadeIn"
        }`}
        onClick={handleClose}
      >
        {/* Header toolbar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent z-10">
          <span className="text-sm font-semibold tracking-wider">
            {activeLightboxIndex + 1} / {mediaItemsToUse.length}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Left Arrow */}
        {mediaItemsToUse.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Center Content */}
        <div 
          className={`max-w-[85vw] max-h-[80vh] flex flex-col items-center justify-center gap-4 ${
            isClosing ? "animate-scaleOut" : "animate-scaleIn"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {mediaItemsToUse[activeLightboxIndex].messageType === "image" ? (
            <img
              src={getMediaUrl(mediaItemsToUse[activeLightboxIndex].mediaUrl)}
              alt="Fullscreen view"
              className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <video
              src={getMediaUrl(mediaItemsToUse[activeLightboxIndex].mediaUrl)}
              controls
              autoPlay
              className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
          )}
          
          {mediaItemsToUse[activeLightboxIndex].text && (
            <p className="text-white text-sm max-w-lg text-center bg-black/35 px-4 py-2 rounded-xl backdrop-blur-sm">
              {renderTextWithLinks(mediaItemsToUse[activeLightboxIndex].text || "", true)}
            </p>
          )}
        </div>

        {/* Right Arrow */}
        {mediaItemsToUse.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    );

    return createPortal(lightboxContent, document.body);
  };

  const handleReplyClick = () => {
    dispatch(
      setReplyingToMessage({
        _id: id,
        text: text || "",
        messageType,
        mediaUrl,
        sender: {
          _id: isOwn ? loggedInUser?._id || "" : "",
          name: isOwn ? loggedInUser?.name || "Me" : message.senderName || "User",
          phone: "",
        },
        readBy: [],
        deliveredTo: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
    );
  };

  if (isOwn) {
    return (
      <>
        <div className="flex w-full mb-2 justify-end items-center animate-fadeIn group">
          {/* Reply Button on Hover */}
          <button
            type="button"
            onClick={handleReplyClick}
            className="mr-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Reply"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          <div id={`message-${id}`} className="flex flex-col max-w-[75%] sm:max-w-[60%] items-end rounded-2xl">
            {/* Message Box */}
            <div 
              className={`relative rounded-2xl shadow-sm overflow-hidden
                ${useCompactPadding ? 'p-1' : 'px-4 py-2.5'}
                bg-gradient-to-br from-emerald-600 to-teal-500 text-white dark:from-[#0b382c] dark:to-[#022b22] dark:text-emerald-100 dark:border dark:border-emerald-800/30 rounded-br-none shadow-md shadow-emerald-500/5 dark:shadow-none
              `}
            >
              {parentMessage && renderReplyPreview(parentMessage)}
              {renderContent()}
            </div>

            {/* Timestamp & Status */}
            <div className="flex items-center mt-1 space-x-1.5 px-1">
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {time}
              </span>
              {isOwn && status && <SeenIndicator status={status} />}
            </div>
          </div>
        </div>
        {renderLightbox()}
      </>
    );
  }

  return (
    <>
      <div className="flex w-full mb-2 justify-start items-center animate-fadeIn group">
        <div id={`message-${id}`} className="flex flex-col max-w-[75%] sm:max-w-[60%] items-start rounded-2xl">
          {/* Message Box */}
          <div 
            className={`relative rounded-2xl shadow-sm overflow-hidden
              ${useCompactPadding ? 'p-1' : 'px-4 py-2.5'}
              bg-white border border-slate-100 text-gray-900 rounded-bl-none dark:bg-gray-800 dark:border-gray-700/50 dark:text-gray-100 shadow-sm
            `}
          >
            {parentMessage && renderReplyPreview(parentMessage)}
            {renderContent()}
          </div>

          {/* Timestamp */}
          <div className="flex items-center mt-1 space-x-1.5 px-1">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {time}
            </span>
          </div>
        </div>

        {/* Reply Button on Hover */}
        <button
          type="button"
          onClick={handleReplyClick}
          className="ml-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center"
          title="Reply"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
      </div>
      {renderLightbox()}
    </>
  );
};

export default MessageBubble;