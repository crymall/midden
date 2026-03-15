import { useEffect } from "react";
import { Link } from "react-router-dom";
import useData from "../../context/data/useData";
import useAuth from "../../context/auth/useAuth";
import MiddenCard from "../../components/MiddenCard";

const Messages = () => {
  const { user } = useAuth();
  const { threads, getThreads } = useData();

  useEffect(() => {
    getThreads();
  }, [getThreads]);

  return (
    <MiddenCard>
      <h2 className="mb-4 font-gothic text-4xl font-bold text-white">
        Messages
      </h2>
      <div className="flex flex-col gap-2">
        {threads.length === 0 ? (
          <div className="text-lightGrey font-mono text-sm">
            No conversations yet.
          </div>
        ) : (
          threads.map((thread) => {
            const isUnread =
              String(thread.sender_id) !== String(user?.id) && !thread.is_read;

            let threadContent = thread.content;
            if (thread.recipe_id) {
              const senderName =
                String(thread.sender_id) === String(user?.id)
                  ? "You"
                  : thread.other_username;
              threadContent = `${senderName} shared a recipe${
                thread.content ? `: ${thread.content}` : ""
              }`;
            }

            return (
              <Link
                key={thread.other_user_id}
                to={`/applications/canteen/messages/${thread.other_user_id}`}
                className={`border-grey hover:border-accent group block border-2 border-dashed p-4 transition-colors ${
                  isUnread ? "bg-accent/10" : ""
                }`}
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <span className="group-hover:text-accent font-mono text-lg font-bold text-white transition-colors">
                      {thread.other_username}
                    </span>
                    {isUnread && (
                      <span className="bg-accent h-2 w-2 rounded-full" />
                    )}
                  </div>
                  <span className="text-grey text-xs">
                    {new Date(thread.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p
                  className={`${isUnread ? "text-white font-bold" : "text-lightGrey"} truncate font-mono text-sm`}
                >
                  {threadContent}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </MiddenCard>
  );
};

export default Messages;