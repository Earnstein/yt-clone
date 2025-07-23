import { UserSection } from "../sections/user-section";

interface UserViewProps {
  userId: string;
}

export const UserView: React.FC<UserViewProps> = ({ userId }) => {
  return (
    <div className="flex flex-col max-w-[1300px] mx-auto px-4 pt-2.5 mb-10 gap-y-6">
      <UserSection userId={userId} />
    </div>
  );
};
