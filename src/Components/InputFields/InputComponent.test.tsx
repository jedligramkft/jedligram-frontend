import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputComponent } from './InputComponent';

describe('InputComponent', () => {
	it('calls onChange when typing', () => {
		const mockOnChange = vi.fn();

		render(
			<InputComponent
				label="Email"
				placeholder="Enter email"
				value=""
				onChange={mockOnChange}
			/>
		);

		fireEvent.change(
			screen.getByPlaceholderText('Enter email'),
			{ target: { value: 'test@test.com' } }
		);

		expect(mockOnChange).toHaveBeenCalled();
	});
});