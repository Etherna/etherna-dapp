import React from "react"
import PropTypes from "prop-types"
import classnames from "classnames"

import "./modal.scss"

const Modal = ({
    children,
    show,
    setShow,
    title,
    titleTag,
    showCloseButton,
}) => {
    let handleToggle = () => {
        setShow && setShow(!show)
    }

    let handleKeyDown = e => {
        if (e.keyCode === 13) {
            handleToggle()
        }
    }

    const TitleTag = `${titleTag}`

    return (
        <>
            <div className={classnames("modal", { show: show })}>
                <div className="modal-dialog">
                    {((title && title !== "") || showCloseButton) && (
                        <div className="modal-header">
                            <TitleTag className="modal-title">{title}</TitleTag>
                            <div
                                className="close"
                                role="button"
                                tabIndex={0}
                                onClick={handleToggle}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    )}
                    {children}
                </div>
            </div>
            <div
                className={classnames("modal-backdrop", { show: show })}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
            />
        </>
    )
}

Modal.propTypes = {
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func,
    title: PropTypes.string,
    titleTag: PropTypes.string,
    showCloseButton: PropTypes.bool,
}

Modal.defaultProps = {
    titleTag: "h5",
}

export default Modal
