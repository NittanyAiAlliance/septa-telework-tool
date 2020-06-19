import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavItem from "react-bootstrap/NavItem";
import {Link} from "react-router-dom";
import * as React from "react";

export interface NavigationBarProps {}

export class NavigationBar extends React.Component<NavigationBarProps, {}> {
    render() {
        return(
            <div>
                <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <NavItem>
                                <Nav.Link as={Link} to="/">Home</Nav.Link>
                            </NavItem>
                            <NavItem>
                                <Nav.Link as={Link} to="/ai">AI</Nav.Link>
                            </NavItem>
                            <NavItem>
                                <Nav.Link as={Link} to="/interpretation">Interpretation</Nav.Link>
                            </NavItem>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        );
    }
}