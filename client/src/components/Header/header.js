import React from 'react'
import { Layout, Typography, Divider } from "antd";
const { Title } = Typography;
const { Header } = Layout;

const headerStyle = {
  height: 100,
  lineHeight: "64px",
  backgroundColor: "#FFFFFF",
};

function Head(){
  return (
    <Layout>
      <Header style={headerStyle}>
        <Title>Fazt Zhare</Title>
        <Divider />
      </Header>
    </Layout>
  );
};

export default Head;
