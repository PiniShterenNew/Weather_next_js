type Properties = {
  length: number;
  currentIndex: number;
};

export default function DotsIndicator({ length, currentIndex }: Properties) {
  return (
    <div className="flex justify-center gap-2" data-testid="dots-indicator">
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          data-testid="dot"
          className={`h-2 w-2 rounded-full transition-all ${
            index === currentIndex ? 'bg-primary w-4' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
}
