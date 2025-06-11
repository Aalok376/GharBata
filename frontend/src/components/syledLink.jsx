
import React from "react"
import { Link } from "react-router-dom"
import styled from 'styled-components'

const StyledLink = styled(Link)`
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

            width: ${({ fullwidth }) => (fullwidth ? '100%' : 'auto')};
            fontSize: ${({ fontSize }) => fontSize || '1rem'};
            padding: ${({ padding }) => padding || '0.5rem 1rem'};
            text-align: ${({ align }) => align || 'center'}

            &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
`

const StyledLinkFunc = ({ dynamicId, text, ...rest }) => {

    return (
        <StyledLink to={dynamicId} {...rest}>{text}</StyledLink>
    )
}

export default StyledLinkFunc

{/*
import React from "react"
import { Link } from "react-router-dom"

const StyledLinkFunc = ({ dynamicId, text, fullwidth, fontSize, padding, align, ...rest }) => {
  // Build classes dynamically based on props
  const baseClasses = `
    inline-block
    rounded-full
    font-semibold
    cursor-pointer
    transition
    duration-300
    ease-in-out
    bg-gradient-to-r
    from-indigo-500
    to-purple-700
    text-white
    shadow-md
    hover:shadow-lg
    hover:-translate-y-0.5
    hover:shadow-indigo-400
  `

  const widthClass = fullwidth ? "w-full" : "w-auto"
  const textAlignClass = align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center"
  const paddingClass = padding
    ? "" // We will handle custom padding inline style below
    : "py-2 px-4" // default padding

  // For fontSize and padding if provided as custom values, use inline styles
  const style = {
    fontSize: fontSize || undefined,
    padding: padding || undefined,
  }

  return (
    <Link
      to={dynamicId}
      className={`${baseClasses} ${widthClass} ${textAlignClass} ${paddingClass}`}
      style={style}
      {...rest}
    >
      {text}
    </Link>
  )
}

export default StyledLinkFunc;
*/}

