import MiddenCard from "../components/MiddenCard";
import AppGrid from "../components/AppGrid";
import { explorerLinkList } from "./utils/constants";

const Explorer = () => {
  return (
    <MiddenCard>
      <AppGrid items={explorerLinkList} />
    </MiddenCard>
  );
};

export default Explorer;
