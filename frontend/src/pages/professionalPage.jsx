import React from "react"
import styled from "styled-components"
 import ClientNavbar from "../components/NavBarForClientAndProfessional"

 const ClientPage=()=>{
    return (
        <Body>
            <ClientNavbar></ClientNavbar>
        </Body>
    )
 }

 const Body=styled.div` 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            color: #333;`

 export default ClientPage