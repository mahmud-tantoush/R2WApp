import React, {Component} from 'react';
import {
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Container
} from 'reactstrap';

// build a new class from the Componeents class
class AppNavbar extends Component{
    state = {
        isOpen: false
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }
    render(){

        return(
            <div>
                <Navbar color='dark' dark expand='sm' className='mb-7'>
                    <Container>
                        <NavbarBrand href='/'>R2W</NavbarBrand>
                        <NavbarToggler onClick={this.toggle}></NavbarToggler>
                    </Container>
                </Navbar>
            </div>
        )
    }
}


export default AppNavbar
