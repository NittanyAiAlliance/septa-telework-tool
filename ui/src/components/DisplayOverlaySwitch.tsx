import * as React from 'react';
import { Form } from 'react-bootstrap';

export interface DisplayOverlaySwitchProps {
    title : string;
    name: string;
    onChange(key: string, value: boolean) : any;
    checked? : boolean;
}

export class DisplayOverlaySwitch extends React.Component<DisplayOverlaySwitchProps, {}> {
    state = {
        checked: false
    };
    constructor(props: DisplayOverlaySwitchProps){
        super(props);
        this.state = {
            checked: false
        };
        this.handleToggle=this.handleToggle.bind(this);
    }
    handleToggle(){
        this.state.checked = !this.state.checked;
        this.props.onChange(this.props.name, this.state.checked)
    }
    render(){
        const titleLabel : string = "Show " + this.props.title;
        return (
            <Form.Check type="switch" label={titleLabel} id={this.props.title} onChange={this.handleToggle} checked={this.props.checked} />
        );
    }
}