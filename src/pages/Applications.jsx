import MiddenCard from "../components/MiddenCard";
import AppGrid from "../components/AppGrid";
import { applicationList } from "./utils/constants";

const Applications = () => {
  return (
    <MiddenCard>
      <AppGrid items={applicationList} />
    </MiddenCard>
  );
};

export default Applications;