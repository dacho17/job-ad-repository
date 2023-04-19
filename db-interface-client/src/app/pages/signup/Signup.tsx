import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from '../../../dtos/User';
import { UserRole } from '../../../enums/userRole';
import FormInput from '../../../interface/FormInput';
import GenDropdown from '../../components/genDropdown/GenDropdown';
import GenForm from '../../components/genForm/GenForm';
import { signUp } from '../../services/slices/AuthSlice';
import { useAppDispatch, useAppSelector } from '../../services/store';
import './Signup.css';

function SignupPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { authErrorMsg, user } = useAppSelector(state => state.auth);

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
    const [userRole, setUserRole] = useState({
        entered: UserRole.NOT_SELECTED.valueOf(),
        isValid: false,
        touched: false
    });

    const validateUsername = (username: string): boolean => username.length > 5;
    const validatePassword = (password: string): boolean => password.length > 5;
    const validateUserRole = (role: number): boolean => Object.values(UserRole).includes(role) && role !== 0;
    const loginElement = <span className="gen-form__text">Already have an account? <a href='/login' className="gen-form__text-highlighted">Login here!</a></span>;
    
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

    const userRoleDropdownHandles: FormInput = {
        entered: userRole.entered,
        isValid: userRole.isValid,
        touched: userRole.touched,
        setStateFn: setUserRole,
        name: 'user role',
        errMsg: 'One of the user roles must be chosen',
        validationFn: validateUserRole
    } 

    async function onSignupFormSubmit() {
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
        setUserRole((prevState) => {
            return {
                entered: prevState.entered,
                isValid: validateUserRole(prevState.entered),
                touched: true
            }
        });

        if (!username.isValid || !password.isValid || !userRole.isValid) {
            console.log('The form is invalid and cannot be sent');
            return 
        }

        const newUser = {
            username: username.entered,
            password: password.entered,
            role: userRole.entered
        } as User;

        await dispatch(signUp(newUser));
    }

    const SELECT_ROLE = "Select role";
    const JOB_SEEKER = "Job seeker";
    const JOB_PROVIDER = "Job provider";
    const ADMIN = "Admin";
    const listOfValueLabelPairs = [
        [UserRole.NOT_SELECTED.valueOf(), SELECT_ROLE],
        [UserRole.JOB_SEEKER.valueOf(), JOB_SEEKER],
        [UserRole.JOB_PROVIDER.valueOf(), JOB_PROVIDER],
        [UserRole.ADMIN.valueOf(), ADMIN]
    ] as [any, string][];
    const userRoleDropdown = <GenDropdown
        key={userRoleDropdownHandles.name}
        dropdownHandles={userRoleDropdownHandles}
        listOfValueLabelPairs={listOfValueLabelPairs}
    />

    return (
        <>   
            <div className="landing-section">
                <div className="landing-background">
                </div>
                <div className='dark-overlay'/>

                <GenForm
                    formTitle='Signup'
                    buttonLabel='Signup'
                    listOfFormInputs={formInputs}
                    onFormSubmitFn={onSignupFormSubmit}
                    loginSignupElement={loginElement}
                    additionalElements={[userRoleDropdown]}
                    resMessageElement={authErrorMsg ? <div className="gen-form-input__error-msg">{authErrorMsg}</div> : null}
                />
                {authErrorMsg &&  <div className="gen-form-input__error-msg">{authErrorMsg}</div>}
            </div>
        </>
    );
}

export default SignupPage;
