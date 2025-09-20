import { TextField } from "@mui/material"
import { useEffect, useRef, useState } from "react"

const LectureTopicInput = ({setTopicGlobal}) => {

    const [topic, setTopic] = useState("");
    const timeoutRef = useRef();

    useEffect(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setTopicGlobal(topic);
        }, 300);

        return clearTimeout(timeoutRef);
    }, [topic]);

    return (
        <TextField
            size="small"
            label="Lecture Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            autoComplete="off"
        />
    )
}

export default LectureTopicInput