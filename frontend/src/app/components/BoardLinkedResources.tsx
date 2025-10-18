import React from "react";
// import { FiExternalLink } from "react-icons/fi";
import { FileText, X } from "lucide-react";
import ExternalLinkIcon from "../icons/ExternalLinkIcon";

const BoardLinkedResources: React.FC = () => {
  const boardDescription =
    "This board is used to manage design, development, and documentation resources across the project lifecycle.";

  const documentationLinks = [
    {
      title: "Project Overview",
      url: "https://docs.google.com/document/d/12345",
      description: "High-level goals, timelines, and project milestones.",
    },
    {
      title: "Technical Specification",
      url: "https://docs.google.com/document/d/67890",
      description: "Detailed technical architecture and API references.",
    },
    {
      title: "Team Roles & Responsibilities",
      url: "https://docs.google.com/document/d/11223",
      description: "List of team members and their assigned tasks.",
    },
  ];

  const links = [
    {
      title: "UI Design Mockups",
      url: "https://figma.com/file/123",
      icon: "Fi",
      color: "bg-black",
    },
    {
      title: "Backend Repository",
      url: "https://github.com/company/project",
      icon: "GH",
      color: "bg-gray-800",
    },
    {
      title: "Product Requirements",
      url: "https://notion.so/product-requirements",
      icon: "N",
      color: "bg-white text-black border border-gray-300",
    },
    {
      title: "Meeting Notes",
      url: "https://docs.google.com/document/123",
      icon: "GD",
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="w-76 space-y-3 border-l border-gray-200 p-4">
      <div>
        <h2 className="text-sm font-semibold text-[#6B7280] mb-3">
          BOARD DESCRIPTION
        </h2>
        <p className="text-sm text-gray-500 mt-1 leading-snug">
          {boardDescription}
        </p>
      </div>

      {/*Board Documentation Section */}
      <div className="">
        <p className="text-sm font-medium text-[#6B7280] mb-3">
          BOARD DOCUMENTATION
        </p>
        <ul className="space-y-3 text-sm">
          {documentationLinks.map((doc) => (
            <li
              key={doc.title}
              className="flex items-start justify-between rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md">
                  <FileText size={16} />
                </div>
                <div className="text-wrap">
                  <p className="font-medium text-gray-800">{doc.title}</p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-wrap text-blue-600 hover:underline"
                  >
                    {doc.url}
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {doc.description}
                  </p>
                </div>
              </div>
              {/* <button className="text-gray-400 hover:text-blue-500 transition">
                <ExternalLinkIcon width={13} height={13} />
              </button> */}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#6B7280] mb-3">
          LINKED RESOURCES
        </h2>

        <ul className="space-y-3">
          {links.map((link) => (
            <li
              key={link.title}
              className="flex items-start justify-between rounded-lg hover:bg-gray-50 p-2"
            >
              <div className="flex items-center space-x-3">
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-md text-white text-xs font-bold ${link.color}`}
                >
                  {link.icon}
                </div>

                {/* Title + URL */}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {link.title}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 truncate block max-w-[160px]"
                  >
                    {link.url}
                  </a>
                </div>

                <button className="hover:cursor-pointer">
                  {/* <FiExternalLink size={15} /> */}
                  <ExternalLinkIcon className="hover:text-red-500" />
                </button>
              </div>

              {/* Action icons */}
              <div className="flex items-center space-x-1 text-gray-400">
                <button className="hover:cursor-pointer hover:text-red-500">
                  <X size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      
    </div>
  );
};

export default BoardLinkedResources;
