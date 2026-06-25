//
//  FlatSignUpView.swift
//  Login
//
//  Created by Shreyash Gajbhiye on 17/08/23.
//

import SwiftUI

struct FlatSignUpView: View {
  @State var username = ""
  @State var email = ""
  @State var password = ""
  @State var passwordAgain = ""

  var body: some View {
    if #available(iOS 15.0,*){
      ZStack{
        GradientBackgroundView()
        VStack{
          Text("Sign Up")
            .font(.largeTitle)
            .bold()
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top)
            .foregroundColor(Color.primary.opacity(0.4))
          
          Text("Create New Account")
            .font(.callout)
            .frame(maxWidth: .infinity,alignment: .leading)
          
          Divider().padding()
          
          VStack(spacing: 12){
            
            TextField("Enter username : ", text: $username)
              .modifier(ConcaveGlassView())
            
            TextField("Enter email : ", text: $email)
              .modifier(ConcaveGlassView())
            
            SecureField("Enter password : ", text: $password)
              .modifier(ConcaveGlassView())
            
            SecureField("Enter Password Again : ", text: $passwordAgain)
              .modifier(ConcaveGlassView())
            
          }
          .padding()
          
          Divider().padding()
          
          Text("By signing up you accept the **Terms of Service** and **Privacy Policy**")
            .font(.footnote)
          
          Button{
            //Add action
          } label: {
            ZStack{
              Text("SIGN UP")
                .bold()
                .frame(maxWidth: .infinity, maxHeight: 50)
                .modifier(ConvexGlass())
                .cornerRadius(14)
                .padding(.bottom, 8)
            }
          }
        }
        .padding()
        .background(.ultraThinMaterial)
        .foregroundColor(Color.primary.opacity(0.35))
        .foregroundStyle(.ultraThinMaterial)
        .cornerRadius(35)
        .padding()
      }
    } else {
      //Fallback on earlier versions
    }

  }
}

struct FlatSignUpView_Previews: PreviewProvider {
  static var previews: some View {
    FlatSignUpView()
  }
}
