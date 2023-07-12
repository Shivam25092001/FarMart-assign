import './home.css';
import React from 'react';
import Head from '../Header/header.js';
import UploadBody from '../Upload/uploadBody.js';
import DownloadBody from '../Download/downloadBody.js';
import { Space } from 'antd';
import { useParams } from "react-router-dom";

function Home(){
    const { shortUrl } = useParams();

    return (
        <div className="home">
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Head />
                {shortUrl && <DownloadBody shortUrl={shortUrl} />}
                <UploadBody />
            </Space>
        </div>
    );
};

export default Home;