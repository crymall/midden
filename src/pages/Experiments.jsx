import MiddenCard from "../components/MiddenCard";
import AppGrid from "../components/AppGrid";
import { experimentList } from "../utils/constants";

const Experiments = () => {
  return (
    <MiddenCard>
      <AppGrid items={experimentList} />
    </MiddenCard>
  );
};

export default Experiments;
