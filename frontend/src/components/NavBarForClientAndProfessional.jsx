import React,{useEffect} from "react"
import styled from "styled-components"
import { NavLink, useNavigate } from "react-router-dom"


const ClientNavbar = ({isOpen,setIsOpen,fname,lname,profilePic,userType}) => {

    const navigate = useNavigate()

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
    }, [isOpen])

    const toggleSidebar = () => {
        setIsOpen(prev => !prev)
    }
    return (
        <TopNavBar>
            <NavbarLeft>
                <Menu_Toggle onClick={toggleSidebar}>☰</Menu_Toggle>
                <NavbarLogo>GharBata</NavbarLogo>
            </NavbarLeft>
            <NavbarRight>
                <UserProfile onClick={()=>{
                    if(userType==='client'){
                    navigate('/clientProfileSetupPage')
                    }
                    else{
                        navigate('/professionalProfilePage')
                    }
                }}>
                    <UserAvatar><img src={profilePic || '/default-avatar.png'} alt="A" className="w-10 h-10 rounded-full object-cover"></img></UserAvatar>
                    <UserInfo>
                        <UserName>{fname} {lname}</UserName>
                    </UserInfo>
                </UserProfile>
            </NavbarRight>
        </TopNavBar>
    )
}

const TopNavBar = styled.div`
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;`

const NavbarLeft = styled.div` 
            display: flex;
            align-items: center;
            gap: 1rem;`

const Menu_Toggle = styled.button` 
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #1e3c72;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            
            &:hover {
            background: rgba(30, 60, 114, 0.1);
            }
            
            @media (max-width: 768px){
                            display: block;
            }
        `

const NavbarLogo = styled.div`  
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;`

const NavbarRight = styled.div` 
            display: flex;
            align-items: center;
            gap: 1.5rem;`

const UserProfile = styled.div` 
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            transition: all 0.3s ease;
            
            &:hover {
            background: rgba(30, 60, 114, 0.1);
        }`

const UserAvatar = styled.div` 
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;`

const UserInfo = styled.div`
            display: flex;
            flex-direction: column;
            
            @media (max-width: 768px) {
                            display: none;
            }                 
            `

const UserName = styled.div` 
            font-weight: 600;
            font-size: 0.9rem;
            color: #333;`

export default ClientNavbar