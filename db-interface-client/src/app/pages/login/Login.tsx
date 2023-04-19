import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from '../../../dtos/User';
import FormInput from '../../../interface/FormInput';
import Button from '../../components/ctaButton/CtaButton';
import GenForm from '../../components/genForm/GenForm';
import LoadingComponent from '../../components/loadingComponent/LoadingComponent';
import { logIn } from '../../services/slices/AuthSlice';
import { useAppDispatch, useAppSelector } from '../../services/store';
import './Login.css';

function LoginPage() {
    const { user, isLoading, authErrorMsg } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/jobs');
    }, [authErrorMsg, user]);

    const [username, setUsername] = useState({
        entered: "",
        isValid: false,
        touched: false
    });
    const [password, setPassword] = useState({
        entered: "",
        isValid: false,
        touched: false
    });

    if (isLoading) {
        return <LoadingComponent />
    }

    if (user) {
        return <>
            <div>You are already logged in</div>
            <Button
                actionFn={() => navigate('/')}
                isDisabled={false}
                label="Go back to jobs"/>
        </>
    }

    const validateUsername = (username: string): boolean => username.length > 5;
    const validatePassword = (password: string): boolean => password.length > 5;

    const signupElement = <span className="gen-form__text">New to the jobRepository? <a href='/signup' className="gen-form__text-highlighted">Sign up now!</a></span>;

    async function onLoginFormSubmit() {
        setUsername((prevState) => {
            return {
                entered: prevState.entered,
                isValid: validateUsername(prevState.entered),
                touched: true
            }
        });
        setPassword((prevState) => {
            return {
                entered: prevState.entered,
                isValid: validatePassword(prevState.entered),
                touched: true
            }
        });

        if (!username.isValid || !password.isValid) {
            console.log('The form is invalid and cannot be sent');
            return 
        }

        const newUser = {
            username: username.entered,
            password: password.entered,
        } as User;

        await dispatch(logIn(newUser));
    }

    const formInputs: FormInput[] = [
        {
            entered: username.entered,
            isValid: username.isValid,
            touched: username.touched,
            setStateFn: setUsername,
            name: 'username',
            errMsg: 'Username must be at least 6 characters long',
            validationFn: validateUsername
        },
        {
            entered: password.entered,
            isValid: password.isValid,
            touched: password.touched,
            setStateFn: setPassword,
            name: 'password',
            errMsg: 'Password must be at least 6 characters long',
            validationFn: validatePassword
        }
    ];

    return <>
        <GenForm
            formTitle='Login'
            buttonLabel='Login'
            listOfFormInputs={formInputs}
            onFormSubmitFn={onLoginFormSubmit}
            loginSignupElement={signupElement}
            resMessageElement={authErrorMsg ? <div className="gen-form-input__error-msg">{authErrorMsg}</div> : null}
        />
    </>
}

export default LoginPage;
