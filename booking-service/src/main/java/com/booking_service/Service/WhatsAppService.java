package com.booking_service.Service;

import com.twilio.rest.api.v2010.account.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.type.PhoneNumber;
@Service
public class WhatsAppService {

    @Value("${twilio.whatsapp.from}")
    private String from;

    public String sendWhatsAppMessage(String to, String body) {
        Message message = Message.creator(
                new PhoneNumber("whatsapp:" + to),
                new PhoneNumber(from),
                body
        ).create();

        return message.getSid();
    }
}
