import FlowEditor from "../components/flow/FlowEditor";
import Sidebar from "../components/flow/Sidebar";


export default function FlowPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-[15%]">

      <Sidebar />
      </div>
      <div className="flex-1 w-[85%]">
        <FlowEditor />
      </div>
    </div>
  );
}
