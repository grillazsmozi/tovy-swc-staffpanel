import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { workspacestate} from "@/state";
import { useRecoilState } from "recoil";
type Props = {
	children: ReactNode;
	onPress?: () => void;
	onClick?: () => void;
	classoverride?: string;
	loading?: boolean | false;
	workspace?: boolean | false;
	compact?: boolean | false;
	disabled?: boolean | false;
};

const Button: FC<Props> = ({ children, onPress, loading, classoverride, workspace, compact, disabled, onClick }: Props) => {
	return (
		<button
			onClick={onPress || onClick}
			disabled={disabled}
			className={twMerge(`ml-auto bg-[#2196F3] ${compact ? 'py-2 px-4' : 'py-3 px-5'} transition rounded-xl text-sm text-white ${!workspace ? "hover:bg-blue-300  focus-visible:bg-blue-300 disabled:bg-blue-300/50" : "bg-primary hover:bg-primary/50 focus-visible:bg-primary/50 disabled:bg-primary/50"} dark:hover:bg-gray-300 dark:focus-visible:bg-gray-300 dark:bg-white dark:disabled:bg-white/50 dark:text-black focus-visible:outline-none `, classoverride)}
		>
			{loading ? (
				<svg
				className="animate-spin mx-auto h-5 w-5 text-white dark:text-black"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			) : (
				children
			)}
		</button>
	);
};

export default Button;
