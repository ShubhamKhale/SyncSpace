import { useState } from "react";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./IconPicker.scss";
import { useIconPicker } from "./useIconPicker";
import { Grid, type CellComponentProps } from "react-window";
import { IconLookup } from "@fortawesome/free-solid-svg-icons";

export type FontAwesomeIconPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const IconPicker = ({ value, onChange }: FontAwesomeIconPickerProps) => {
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const iconPack = useIconPicker();

  if (!iconPack) {
    return <div>Loading...</div>;
  }

  const uniqueIconPack: IconLookup[] = iconPack.reduce(
    (unique: IconLookup[], icon: IconLookup) => {
      if (!unique.some((obj: IconLookup) => obj.iconName === icon.iconName)) {
        unique.push(icon);
      }
      return unique;
    },
    []
  );

  const iconsFiltered = uniqueIconPack.filter((icon) => {
    return icon.iconName.includes(searchText.toLowerCase());
  });

  const numColumns = 11;
  const numRows = Math.ceil(iconsFiltered.length / numColumns);

  type CellProps = { icons: IconLookup[]; numColumns: number; value?: string; onChange?: (v: string) => void };

  const Cell = ({
    columnIndex,
    rowIndex,
    style,
    icons,
    numColumns: cols,
    value: selectedValue,
    onChange: onSelect,
  }: CellComponentProps<CellProps>) => {
    const icon = icons[rowIndex * cols + columnIndex];
    return (
      <div style={style} className="iconPicker__iconWrapper">
        {icon && (
          <button
            className={`iconPicker__iconItem ${
              icon.iconName === selectedValue ? "selected" : ""
            }`}
            title={icon.iconName}
            onClick={() => onSelect?.(icon.iconName)}
          >
            <FontAwesomeIcon
              icon={icon}
              className="text-black dark:text-white"
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="pl-1">
      <div className="flex flex-row gap-2">
        <button className="">
          {value ? (
            <div className="flex flex-row gap-2 justify-center items-center">
              <FontAwesomeIcon
                onClick={(e: any) => setAnchorEl(e.currentTarget)}
                icon={["fas", value as IconName]}
                className="text-black dark:text-white"
              />
              <button
                onClick={() => {
                  setAnchorEl(null);
                  onChange?.("");
                }}
                className=" bg-red-100 rounded-md p-1 dark:bg-red-700"
              >
                Clear
              </button>
            </div>
          ) : (
            <div onClick={(e: any) => setAnchorEl(e.currentTarget)}>
              Edit Icon
            </div>
          )}
        </button>
      </div>
      {anchorEl === null ? null : (
        <div className="iconPicker__popoverContainer">
          <div className="iconPicker__popoverHeader">
            <input
              className="rounded-md pl-2 bg-white dark:bg-black dark:text-white"
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Grid
            className="iconPicker__iconsContainer"
            style={{ width: 400, height: 200 }}
            defaultWidth={400}
            defaultHeight={200}
            columnCount={numColumns}
            rowCount={numRows}
            columnWidth={35}
            rowHeight={35}
            cellComponent={Cell}
            cellProps={{ icons: iconsFiltered, numColumns, value, onChange }}
          />
        </div>
      )}
    </div>
  );
};
export default IconPicker;
