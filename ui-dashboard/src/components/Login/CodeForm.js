import {Button, Form, Grid, Header, Segment} from "semantic-ui-react";
import React from "react";
import {withTranslation} from "react-i18next";

const CodeForm = (props) => {
    const {t} = props;
    return (
        <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
            <Grid.Column style={{maxWidth: 450}}>
                <Header as='h2' color='teal' textAlign='center'>
                    {t('login.title')}
                </Header>
                <Form size='large'>
                    <Segment stacked>
                        <Form.Input
                            fluid icon='user'
                            iconPosition='left'
                            value={props.code}
                            placeholder={t('login.code')}
                            onChange={props.codeChange}/>
                        <Button color='teal' fluid size='large' onClick={props.onCodeFormButtonClick}>
                            {t('login.button')}
                        </Button>
                    </Segment>
                </Form>
            </Grid.Column>
        </Grid>
    )
};

export default withTranslation()(CodeForm);
