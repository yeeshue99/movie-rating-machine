import StarIcon from "../assets/star.svg?react";

interface StarButtonProps {
  value: number;
  rating: number;
  onClick: (value: number) => void;
}

function StarButton({ value, rating, onClick }: StarButtonProps) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`starButton ${rating >= value ? "active" : "inactive"}`}
    >
      <StarIcon className="star-icon" />
    </button>
  );
}

export default StarButton;
