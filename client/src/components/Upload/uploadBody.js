import "./uploadBody.css";
import React, { useState } from "react";
import axios from "axios";
import baseUrl from "../../API_BASE_URL.js";
import {
  Typography,
  Upload,
  Button,
  Card,
  Space,
  Result,
  message,
  Spin,
} from "antd";
import {
  UploadOutlined,
  CopyOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
const { Text } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: "48px" }} spin />;

const UploadBody = () => {
  const allowedFileTypes = /\.(jpg|jpeg|png|gif|md|txt|pdf|doc|docx|xls|pptx)$/;
  const [allowedFileError, setAllowedFileError] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const info = (message) => {
    messageApi.info(message);
  };

  const handleCopyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${window.location.origin}/${result.shortUrl}`
      );
      setIsCopied(true);
      info("Short URL copied to clipboard");
    } else {
      setIsCopied(false);
      info("Copying to clipboard is not supported by your browser");
    }
  };

  const handleFileChange = (file) => {
    if (file && !allowedFileTypes.test(file.name)) {
      setAllowedFileError(true);
      return;
    }
    setAllowedFileError(false);
    setFile(file);
  };

  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file.originFileObj);

      setIsLoading(true); // Set loading state to true

      axios
        .post(`${baseUrl}/api/upload`, formData,{
          "Access-Control-Allow-Origin": "*" ,
          "Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        })
        .then((response) => {
          const data = response.data;
          setResult({
            success: data.success,
            shortUrl: data ? data.newFile.shortUrl : null,
            publicUrl: data ? data.newFile.fileUrl : null,
          });
          setFile(null);
        })
        .catch((error) => {
          console.log(error);
          return alert(error.message);
        })
        .finally(() => {
          setIsLoading(false); // Set loading state back to false
        });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  return (
    <span className="upload-body">
      {contextHolder}

      <Card style={{ width: "50vw" }}>
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <h3>File Upload</h3>

          {isLoading ? (
            <Spin size="large" indicator={antIcon} />
          ) : result ? (
            <Result status={result.success ? "success" : "error"}
              title={
                result.success
                  ? "File Uploaded Successfully!"
                  : "File Upload Failed"
              }
              subTitle={
                result.success ? (
                  <p>
                    Short URL: {result.shortUrl}
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={handleCopyToClipboard}
                      style={{ marginLeft: 10 }}
                    >
                      {isCopied ? "Copied!" : "Share"}
                    </Button>
                  </p>
                ) : (
                  "Something went wrong. Please try again."
                )
              }
              extra={
                result.success
                  ? [
                      <Button
                        key="short_url"
                        type="primary"
                        href={result.publicUrl}
                      >
                        Download File
                      </Button>,
                      <Button key="reset" onClick={() => setResult(null)}>
                        Upload another file
                      </Button>,
                    ]: null }
            />
          ) : (
            <div
              className="upload-container"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              
                <Upload.Dragger
                  beforeUpload={() => false}
                  fileList={file ? [file] : []}
                  onChange={(info) => {
                    if (info.fileList.length > 0) {
                      handleFileChange(info.fileList[0]);
                    } else {
                      handleFileChange(null);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag a file to upload
                  </p>
                </Upload.Dragger>
                  <br/>
                <Button
                  type="primary"
                  onClick={handleUpload}
                  disabled={!file || isLoading}
                >
                  Upload
                </Button>
              
              {allowedFileError && (
                <Text type="danger">
                  <i>
                    Please upload a file with one of the following extensions:
                    .jpg, .jpeg, .png, .gif, .md, .txt, .pdf, .doc, .docx, .xls,
                    .pptx
                  </i>
                </Text>
              )}
            </div>
          )}
        </Space>
      </Card>
    </span>
  );
};

export default UploadBody;