import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { columns } from "./internals/data/gridData";
import fetchAllLogs from "../utils/api/fetchLogAnalytics";
import LogDetailsDialog from "./LogDetailsDialog";

export default function CustomizedDataGrid() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  // State to track the currently selected row for the overlay
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [selectLogMessage, setSelectLogMessage] =
    React.useState("No data available");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllLogs();
        if (!data) {
          throw new Error("No data found");
        }
        setRows(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle row click event to open the overlay with details
  const handleRowClick = (params) => {
    setSelectedRow(params.row);
    setSelectLogMessage(params.row.message);
  };

  // Close the overlay
  const handleCloseOverlay = () => {
    setSelectedRow(null);
    setSelectLogMessage("No data available");
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 20, 50]}
        density="compact"
        onRowClick={handleRowClick}
        slotProps={{
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: {
                variant: "outlined",
                size: "small",
              },
              columnInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              operatorInputProps: {
                variant: "outlined",
                size: "small",
                sx: { mt: "auto" },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: "outlined",
                  size: "small",
                },
              },
            },
          },
        }}
      />

      <LogDetailsDialog
        selectedRow={selectedRow}
        onClose={handleCloseOverlay}
        logMessage={selectLogMessage}
      />
    </>
  );
}
