import React from 'react';
import { mount } from 'enzyme';
import useWebStorage from '.';

const KEY = 'TEST_STORAGE';
const MINUTE = 1000 * 60;

const TestComponent = () => {
    const [val, setVal] = useWebStorage('test', {
        key: KEY,
        expiresIn: MINUTE,
    });

    return (
        <>
            <div datatest-id='result'>{val}</div>
            <button id='button' onClick={() => setVal('new')}>clickme</button>
        </>
    );
};

it('Should return the default value', () => {
    const component = mount(<TestComponent />);
    expect(component.find("[datatest-id='result']").text()).toBe('test');
});

it('Should change the value when set function is used', () => {
    const component = mount(<TestComponent />);
    const button = component.find("#button");
    button.simulate('click');
    expect(component.find("[datatest-id='result']").text()).toBe('new');
});

it('Should get the value from storage', () => {
    const component = mount(<TestComponent />);
    const button = component.find("#button");
    button.simulate('click');
    const component2 = mount(<TestComponent />);
    expect(component2.find("[datatest-id='result']").text()).toBe('new');
});

it('Should get the default value when cache expires', () => {
    const component = mount(<TestComponent />);
    const button = component.find("#button");
    button.simulate('click');
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + MINUTE + 1);
    const component2 = mount(<TestComponent />);
    expect(component2.find("[datatest-id='result']").text()).toBe('test');
});
