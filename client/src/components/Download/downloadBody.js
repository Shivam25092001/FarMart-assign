import React, { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../API_BASE_URL.js";
import { Card, Button } from "antd";

const DownloadBody = ({ shortUrl }) => {
  console.log(shortUrl);
  const [fileData, setFileData] = useState(null);


  useEffect(() => {    
    const fetchFileData = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/file/${shortUrl}`
        );
        setFileData(response.data);
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          console.log(error);
          return alert(
            "Server is not running. Please start the server and try again."
          );
        }
        const response = error.response;
        response ? setFileData(response.data) : console.log(error);
      }
    };


    fetchFileData();
  }, [shortUrl]);

  return(
      fileData ? (
      <div className="download-body">
        <Card size="small" title="File found" style={{ width: 300 }}>
          <p>{fileData.filename}</p>
          <Button type="primary" href={fileData.publicUrl}>
            Download File
          </Button>
        </Card>
      </div>
      ) : (
      <div className="download-body">
        <Card size="small" title="File not found" style={{ width: 300 }}>
          <p>No file found with current URL !</p>
        </Card>
      </div>
      )
  );
};

export default DownloadBody;