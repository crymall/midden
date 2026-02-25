import MiddenCard from "../components/MiddenCard";
import AppGrid from "../components/AppGrid";
import { experimentLinkList } from "../utils/constants";

const Experiments = () => {
  return (
    <MiddenCard>
      <AppGrid items={experimentLinkList} />
    </MiddenCard>
  );
};

export default Experiments;
