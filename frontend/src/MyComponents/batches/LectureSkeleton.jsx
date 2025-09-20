import { Skeleton, Stack } from "@mui/material";

const LectureSkeleton = ({ number }) => {
  return (
    <Stack spacing={0.2}>
      {Array.from({ length: number }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" width="100%" height={74} />
      ))}
    </Stack>
  );
};

export default LectureSkeleton;